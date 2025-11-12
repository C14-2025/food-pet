#!/bin/bash
set -e

JENKINS_URL=http://jenkins:8080
SONAR_URL=http://sonarqube:9000


# Verifica se já rodou
if [ -f /setup_done/.ran ]; then
  echo "Setup já executado, saindo..."
  exit 0
fi

# Aguardar Jenkins ficar UP
echo "Aguardando Jenkins ficar UP..."
until curl -s $JENKINS_URL/login > /dev/null; do
  echo -n "."
  sleep 5
done
echo "Jenkins está UP!"

# Aguardar SonarQube ficar UP
echo "Aguardando SonarQube ficar UP..."
until curl -s $SONAR_URL/api/system/status | grep -q '"status":"UP"'; do
  echo -n "."
  sleep 5
done
echo "SonarQube está UP!"

# Baixar jenkins-cli.jar se ainda não existir
if [ ! -f /jenkins-cli.jar ]; then
  echo "Baixando jenkins-cli.jar..."
  curl -s -o /jenkins-cli.jar ${JENKINS_URL}/jnlpJars/jenkins-cli.jar
fi

# Gerar token do SonarQube via API
TOKEN=$(curl -s -u admin:admin -X POST "$SONAR_URL/api/user_tokens/generate" -d "name=jenkins_token" | jq -r '.token')
echo "Token gerado: $TOKEN"

# Criar credencial no Jenkins via CLI
java -jar /jenkins-cli.jar -s $JENKINS_URL -auth admin:admin create-credentials-by-xml system::system::jenkins _ <<EOF
<org.jenkinsci.plugins.plaincredentials.impl.StringCredentialsImpl>
  <scope>GLOBAL</scope>
  <id>sonarqube-token</id>
  <description>Token do SonarQube</description>
  <secret>$TOKEN</secret>
</org.jenkinsci.plugins.plaincredentials.impl.StringCredentialsImpl>
EOF

echo "Credencial criada no Jenkins com sucesso!"

# Criar webhook no SonarQube apontando para o Jenkins
echo "Criando webhook do SonarQube para o Jenkins..."

curl -s -u "$TOKEN:" \
  -X POST "$SONAR_URL/api/webhooks/create" \
  -d "name=Jenkins" \
  -d "url=${JENKINS_URL}/sonarqube-webhook/" \

echo "Webhook configurado com sucesso!"

# Marca que rodou
mkdir -p /setup_done
touch /setup_done/.ran