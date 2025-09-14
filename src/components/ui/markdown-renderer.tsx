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
                    <h1 className="text-3xl font-bold mt-6 mb-4 pb-2 border-b-2 border-primary/20 text-foreground" {...props} />
                ),
                h2: ({ node, ...props }) => (
                    <h2 className="text-2xl font-bold mt-5 mb-3 pb-2 border-b border-primary/10 text-foreground" {...props} />
                ),
                h3: ({ node, ...props }) => (
                    <h3 className="text-xl font-bold mt-4 mb-2 text-foreground" {...props} />
                ),
                h4: ({ node, ...props }) => (
                    <h4 className="text-lg font-bold mt-3 mb-2 text-foreground/90" {...props} />
                ),
                p: ({ node, ...props }) => (
                    <p className="mb-4 text-foreground/80 leading-7" {...props} />
                ),
                a: ({ node, ...props }) => (
                    <a
                        className="text-primary hover:text-primary/80 underline underline-offset-4 decoration-primary/30 hover:decoration-primary/50 font-medium transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                        {...props}
                    />
                ),
                blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-4 border-primary/40 pl-5 py-2 my-5 bg-primary/5 rounded-r-lg" {...props} />
                ),
                code: ({ node, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return !match ? (
                        <code className="bg-muted px-2 py-1 rounded-md text-sm font-mono font-medium text-primary" {...props}>
                            {children}
                        </code>
                    ) : (
                        <code className={className} {...props}>
                            {children}
                        </code>
                    );
                },
                ul: ({ node, ...props }) => (
                    <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground/80" {...props} />
                ),
                ol: ({ node, ...props }) => (
                    <ol className="list-decimal pl-6 mb-4 space-y-2 text-foreground/80" {...props} />
                ),
                li: ({ node, ...props }) => (
                    <li className="leading-7 pl-1" {...props} />
                ),
                // 表格
                table: ({ node, ...props }) => (
                    <div className="overflow-x-auto my-5 rounded-lg border border-border shadow-sm">
                        <table className="w-full border-collapse bg-background" {...props} />
                    </div>
                ),
                th: ({ node, ...props }) => (
                    <th className="border border-border bg-primary/10 px-4 py-3 text-left font-bold text-foreground" {...props} />
                ),
                td: ({ node, ...props }) => (
                    <td className="border border-border px-4 py-3 text-foreground/80" {...props} />
                ),
                // 水平线
                hr: ({ node, ...props }) => (
                    <hr className="my-6 border-border/50" {...props} />
                ),
                // 图片
                img: ({ node, ...props }) => (
                    <img className="max-w-full h-auto rounded-lg my-5 shadow-md hover:shadow-lg transition-shadow" {...props} />
                ),
            }}
        >
            {children}
        </Markdown>
    )
}