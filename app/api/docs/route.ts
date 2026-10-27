const SWAGGER_UI = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.33.2';

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>GreenQuote API docs</title>
    <link rel="stylesheet" href="${SWAGGER_UI}/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="${SWAGGER_UI}/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '/api/openapi.json',
        dom_id: '#swagger-ui',
        tryItOutEnabled: true,
        deepLinking: true,
      });
    </script>
  </body>
</html>`;

export function GET() {
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
}
