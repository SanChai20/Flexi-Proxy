import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

export function MarkdownRenderer({ children }: { children: string | undefined }) {
    return (
        <Markdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            components={{
                h1: ({ node, ...props }) => (
                    <h1 className="text-2xl md:text-3xl font-semibold mt-6 mb-4 pb-2 border-b border-border" {...props} />
                ),
                h2: ({ node, ...props }) => (
                    <h2 className="text-xl md:text-2xl font-semibold mt-5 mb-3 pb-2 border-b border-border" {...props} />
                ),
                h3: ({ node, ...props }) => (
                    <h3 className="text-lg md:text-xl font-semibold mt-4 mb-2" {...props} />
                ),
                h4: ({ node, ...props }) => (
                    <h4 className="text-md md:text-lg font-semibold mt-3 mb-2" {...props} />
                ),
                p: ({ node, ...props }) => (
                    <p className="mb-3" {...props} />
                ),
                a: ({ node, ...props }) => (
                    <a
                        className="text-primary hover:underline underline-offset-4 font-medium"
                        target="_blank"
                        rel="noopener noreferrer"
                        {...props}
                    />
                ),
                blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-3 border-primary/50 pl-4 py-1 my-4 bg-muted/30 rounded-r-md" {...props} />
                ),
                code: ({ node, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return !match ? (
                        <code className="bg-muted px-1.5 py-0.5 rounded-md text-sm font-mono font-medium" {...props}>
                            {children}
                        </code>
                    ) : (
                        <code className={className} {...props}>
                            {children}
                        </code>
                    );
                },
                ul: ({ node, ...props }) => (
                    <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />
                ),
                ol: ({ node, ...props }) => (
                    <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />
                ),
                li: ({ node, ...props }) => (
                    <li className="leading-relaxed" {...props} />
                ),
                // 表格
                table: ({ node, ...props }) => (
                    <div className="overflow-x-auto my-4 rounded-lg border border-border shadow-sm">
                        <table className="w-full border-collapse bg-background" {...props} />
                    </div>
                ),
                th: ({ node, ...props }) => (
                    <th className="border border-border bg-muted px-3 py-2 text-left font-semibold text-sm" {...props} />
                ),
                td: ({ node, ...props }) => (
                    <td className="border border-border px-3 py-2 text-sm" {...props} />
                ),
                // 水平线
                hr: ({ node, ...props }) => (
                    <hr className="my-5 border-border" {...props} />
                ),
                // 图片
                img: ({ node, ...props }) => (
                    <img className="max-w-full h-auto rounded-md my-4 shadow-sm" {...props} />
                ),
            }}
        >
            {children}
        </Markdown>
    )
}