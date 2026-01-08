# Use nginx to serve static files
FROM nginx:alpine

# Copy kalendar files to nginx html directory
COPY index.html /usr/share/nginx/html/
COPY hmmmmmmmmmnmmmmnmmmmmm.html /usr/share/nginx/html/
COPY hmmmmmmmmmnmmmmmmmmnmmm.html /usr/share/nginx/html/
COPY cleanup-firebase.html /usr/share/nginx/html/
COPY Logo-PBRP.png /usr/share/nginx/html/
COPY calendar-bg.png /usr/share/nginx/html/

# Create nginx config for proper routing
RUN echo 'server { \
    listen 8080; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # Gzip compression \
    gzip on; \
    gzip_types text/html text/css application/javascript; \
}' > /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

