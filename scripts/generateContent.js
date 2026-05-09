import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const metadata = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/toolsMetadata.json'), 'utf-8'));

const toolContent = {};

const generateHowItWorks = (tool) => {
  return `The ${tool.seoTitle.split(' - ')[0]} tool operates exclusively within the secure sandbox of your local web browser, utilizing modern WebAssembly (Wasm) and HTML5 APIs. When you initiate a task, the computational workload is delegated entirely to your device's CPU and memory. Unlike traditional cloud-based utilities, there is no client-server data transfer protocol involved in the processing phase. The core engine loads the necessary logic locally and executes the required transformations directly on the file blob in memory. This decentralized architecture ensures zero-latency processing, as there are no network bottlenecks or server queues to contend with. The tool leverages asynchronous processing to maintain an uninterrupted user interface, delivering professional-grade results instantaneously while maintaining strict local execution boundaries.`;
};

const generateWhyPrivacyMatters = (tool) => {
  return `Privacy is a fundamental right, especially when dealing with personal files or sensitive data. Traditional online utilities often require you to upload your files to remote, unverified servers for processing. This exposes you to significant risks, including unauthorized data retention, metadata harvesting, and potential data breaches. By utilizing the ${tool.seoTitle.split(' - ')[0]} via PrivateUtils, you completely eliminate these egress risks. Your files are never transmitted across the internet. There are no server logs, no hidden analytics tracking your usage, and no databases storing your sensitive information. This strict no-upload policy guarantees absolute confidentiality, making it safe to process confidential documents, personal media, and proprietary data without compromising your digital security.`;
};

const generateUsageInstructions = (tool) => {
  return `Using the ${tool.seoTitle.split(' - ')[0]} is designed to be intuitive and strictly local. 
1. **Load Your Data:** Begin by dragging and dropping your target file into the designated secure processing zone, or click to browse your local filesystem. Because there are no uploads, the file is immediately available in the browser's memory.
2. **Configure Parameters:** Adjust the necessary settings or formatting options provided by the interface. These configurations dictate how the local engine will process your data.
3. **Execute Processing:** Click the primary action button to commence the operation. You will see real-time progress as your hardware handles the workload locally.
4. **Export Result:** Once the processing concludes, the output is generated directly on your machine. Click the download or copy button to retrieve your final artifact securely, with zero external network calls.`;
};

for (const tool of metadata) {
  toolContent[tool.to] = {
    howItWorks: generateHowItWorks(tool),
    whyPrivacyMatters: generateWhyPrivacyMatters(tool),
    usageInstructions: generateUsageInstructions(tool)
  };
}

fs.writeFileSync(path.join(__dirname, '../src/data/toolContent.json'), JSON.stringify(toolContent, null, 2));
console.log('Successfully generated toolContent.json with ~300 words of rich content per tool.');
