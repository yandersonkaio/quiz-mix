import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism.css";
import "prismjs/components/prism-json";

interface CodeBlockProps {
    code: string;
    language?: string;
}

export function CodeBlock({ code, language = "javascript" }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        Prism.highlightAll();
    }, [code, language]);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative bg-gray-100 dark:bg-gray-800 text-sm p-4 rounded-md border dark:border-gray-700">
            <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="cursor-pointer absolute top-6 right-4"
            >
                {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                ) : (
                    <Copy className="w-4 h-4" />
                )}
            </Button>
            <pre className={`language-${language}`}>
                <code className={`language-${language}`}>{code}</code>
            </pre>
        </div>
    );
}