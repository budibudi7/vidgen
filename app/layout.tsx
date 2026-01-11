import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Zlk Animator",
    description: "Zlk Animator Application",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                {/* Tailwind CDN */}
                <script src="https://cdn.tailwindcss.com" async></script>
                <style dangerouslySetInnerHTML={{
                    __html: `
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            background-color: #0f172a;
            color: #e2e8f0;
          }
          /* Custom scrollbar for better aesthetics */
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          ::-webkit-scrollbar-track {
            background: #1e293b; 
          }
          ::-webkit-scrollbar-thumb {
            background: #475569; 
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #64748b; 
          }
        `}} />
            </head>
            <body>
                <div id="root">{children}</div>
            </body>
        </html>
    );
}
