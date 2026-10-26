FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html/
COPY ["存崽记账.html", "/usr/share/nginx/html/index.html"]

EXPOSE 80
