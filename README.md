
# Automated Malware Scanning with VirusTotal API

This Python script automates file scanning using the VirusTotal API, providing detailed analysis results in a user-friendly terminal format. It is designed to help users quickly check the safety of files by leveraging VirusTotal's powerful scanning capabilities.

## Features
- Uploads a file of your choice to VirusTotal for scanning.
- Displays file name, size, SHA-256 hash, and type description.
- Provides a comprehensive report of antivirus detections.
- Uses colorama for terminal colors to enhance readability.
- Animated typing effect for smoother user interaction.
- Highlights the number of antivirus detections for malicious files.

## Requirements

## Libraries
Make sure the following Python libraries are installed:

- `requests`
- `json`
- `colorama`

Install the required packages using pip:
```bash
  pip install requests colorama
```
VirusTotal API Key
- Obtain a free VirusTotal API key from VirusTotal.
- Save your API key in a file named vt-api.txt in the same directory as the script.

## How to Use
Clone the Repository:
```
git clone https://github.com/rahulkamilya/VT-Scan.git
cd VT-Scan
```
Prepare the Environment:

Ensure `vt-api.txt` contains your VirusTotal API key.

Run the Script
```
python file_scan.py
```
Provide File Path:

- When prompted, enter the path to the file you want to scan.


## Output
- Name, size (in KB), type description, and SHA-256 hash.
- A list of antivirus detections, categorized as `undetected`, `malicious`, or `type-unsupported`.
- Displays the count of malicious detections or confirms the file's safety.

