FROM oraclelinux:7-slim

RUN  yum -y install oracle-release-el7 oracle-nodejs-release-el7 && \
     yum-config-manager --disable ol7_developer_EPEL && \
     yum -y install oracle-instantclient19.3-basiclite nodejs && \
     rm -rf /var/cache/yum

# RUN mkdir -p /app/scripts
WORKDIR /app
ADD package.json /app/
ADD . .
RUN npm install

CMD ["node", "."]
# docker build -t migutak/crondailyletters:5.0 .
# docker run --rm --name cronjobs -e DB_USER=ecol -e DB_PASSWORD=ecol -e DB_CONNECTIONSTRING=158.176.74.125:1564/ORCLCDB.localdomain  migutak/crondailyletters:5.0 node index_manual.js > /tmp/output.log
# docker run -v /tmp:/tmp --name test -d busybox sh -c "while true; do date > /tmp/output.log; sleep 1; done"
