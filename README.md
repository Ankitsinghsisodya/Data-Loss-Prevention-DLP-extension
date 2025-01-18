# DLP Extension

## Overview
The DLP (Data Loss Prevention) Extension is designed to help organizations protect sensitive information from being inadvertently shared or leaked. This extension monitors and controls the flow of data to ensure compliance with data protection policies.

## Features
- **Real-time Monitoring**: Continuously scans for sensitive data in real-time.
- **Customizable Policies**: Define and enforce data protection policies tailored to your organization's needs.
- **Alerts and Notifications**: Receive instant alerts when potential data breaches are detected, for unwanted downloads.
- **Integration**: Seamlessly integrates with existing systems and workflows.

## Installation
To install the DLP Extension, follow these steps:
1. Download the `.crx` extension package from the repo.
2. Extract the package to your desired location.


## Usage
1. Configure the extension by editing the `config.json` file.
2. Start the extension using the command:
    ```sh
    ./start-dlp-extension
    ```
3. Monitor the logs and dashboard for real-time updates on data protection activities.
4. Add websites to the allowlist to control data uploads and data download.
5. Choose the types of files (e.g., PDF, DOCX) that are allowed for download.
6. If the website is in the allowed list, then file will get downloaded and uploaded without any intervention. 
7. Otherwise, any file will not be uploaded but for download part only the specified types of file will not be downloaded.

## Contributing
We welcome contributions from the community. To contribute:
1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Submit a pull request with a detailed description of your changes.

## License
This project is licensed under the MIT License. See the `LICENSE` file for more details.



