import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface VirusTotalUploadResponse {
  data: {
    id: string;
    type: string;
  };
}

interface VirusTotalAnalysisResponse {
  data: {
    attributes: {
      status: string;
      stats: {
        malicious: number;
        suspicious: number;
        undetected: number;
        harmless: number;
        timeout: number;
        'confirmed-timeout': number;
        failure: number;
        'type-unsupported': number;
      };
      results: Record<string, {
        category: string;
        engine_name: string;
        result: string | null;
      }>;
    };
  };
}

interface VirusTotalFileResponse {
  data: {
    attributes: {
      sha256: string;
      meaningful_name?: string;
      size: number;
      type_description: string;
      last_analysis_stats: {
        malicious: number;
        suspicious: number;
        undetected: number;
        harmless: number;
        timeout: number;
        'confirmed-timeout': number;
        failure: number;
        'type-unsupported': number;
      };
      last_analysis_results: Record<string, {
        category: string;
        engine_name: string;
        result: string | null;
      }>;
    };
  };
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const apiKey = Deno.env.get("VIRUSTOTAL_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "VirusTotal API key not configured" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    const uploadResponse = await fetch(
      "https://www.virustotal.com/api/v3/files",
      {
        method: "POST",
        headers: {
          "x-apikey": apiKey,
        },
        body: uploadFormData,
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      return new Response(
        JSON.stringify({ error: "Failed to upload file to VirusTotal", details: errorText }),
        {
          status: uploadResponse.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const uploadResult: VirusTotalUploadResponse = await uploadResponse.json();
    const analysisId = uploadResult.data.id;

    let analysisComplete = false;
    let attempts = 0;
    const maxAttempts = 30;
    let analysisData: VirusTotalAnalysisResponse | null = null;

    while (!analysisComplete && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const analysisResponse = await fetch(
        `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
        {
          headers: {
            "x-apikey": apiKey,
          },
        }
      );

      if (!analysisResponse.ok) {
        attempts++;
        continue;
      }

      analysisData = await analysisResponse.json();
      const status = analysisData.data.attributes.status;

      if (status === "completed") {
        analysisComplete = true;
      }
      
      attempts++;
    }

    if (!analysisComplete || !analysisData) {
      return new Response(
        JSON.stringify({ error: "Analysis timeout" }),
        {
          status: 408,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const fileHash = analysisId.split('-')[0];
    const fileResponse = await fetch(
      `https://www.virustotal.com/api/v3/files/${fileHash}`,
      {
        headers: {
          "x-apikey": apiKey,
        },
      }
    );

    let fileData: VirusTotalFileResponse | null = null;
    if (fileResponse.ok) {
      fileData = await fileResponse.json();
    }

    const stats = analysisData.data.attributes.stats;
    const maliciousCount = stats.malicious + stats.suspicious;
    const totalEngines = Object.keys(analysisData.data.attributes.results).length;

    const result = {
      file_name: file.name,
      file_size: file.size,
      file_hash: fileData?.data.attributes.sha256 || fileHash,
      file_type: fileData?.data.attributes.type_description || file.type,
      malicious_count: maliciousCount,
      total_engines: totalEngines,
      is_malicious: maliciousCount > 0,
      stats: stats,
      results: analysisData.data.attributes.results,
    };

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});