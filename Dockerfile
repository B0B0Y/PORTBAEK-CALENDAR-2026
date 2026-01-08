# Use nginx to serve static files
FROM nginx:alpine

# Copy kalendar files to nginx html directory
COPY index.html /usr/share/nginx/html/
COPY hmmmmmmmmmnmmmmnmmmmmm.html /usr/share/nginx/html/
COPY hmmmmmmmmmnmmmmmmmmnmmm.html /usr/share/nginx/html/
COPY cleanup-firebase.html /usr/share/nginx/html/
COPY init-database.html /usr/share/nginx/html/
COPY calendar-api-2026.js /usr/share/nginx/html/
COPY Logo-PBRP.png /usr/share/nginx/html/
COPY calendar-bg.png /usr/share/nginx/html/

# Create nginx config for proper routing and MIME types
RUN echo 'server { \
    listen 8080; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Serve JavaScript files with correct MIME type \
    location ~ \.js$ { \
        add_header Content-Type application/javascript; \
        try_files $uri =404; \
    } \
    \
    # Serve CSS files with correct MIME type \
    location ~ \.css$ { \
        add_header Content-Type text/css; \
        try_files $uri =404; \
    } \
    \
    # Serve HTML files directly \
    location ~ \.html$ { \
        try_files $uri =404; \
    } \
    \
    # Serve images \
    location ~ \.(png|jpg|jpeg|gif|svg|ico)$ { \
        try_files $uri =404; \
    } \
    \
    # Default: serve index.html for root only \
    location = / { \
        try_files /index.html =404; \
    } \
    \
    # Other paths: try file first, then 404 \
    location / { \
        try_files $uri =404; \
    } \
    \
    # Gzip compression \
    gzip on; \
    gzip_types text/html text/css application/javascript image/png; \
}' > /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

