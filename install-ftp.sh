#!/bin/bash

RED='\033[0;31m'
NC='\033[0m'

echo -e "${RED}"
echo -e "*******************************************************"
echo -e "*  Bienvenue dans le script d'install du serveur FTP  *"
echo -e "*  Ce script installe et configure ProFTPD avec SSL.  *"
echo -e "*******************************************************"
echo ""
read -p "appuyez sur entrée pour lancer l'installation"

echo -e "${NC}"

FQDN="$(hostname -s).eddi.cloud"

installUpdate()
{
  # mise à jour de la base logicielle
  sudo apt-get update

  # mise à jour des logiciels préinstallés
  sudo apt-get -y upgrade
}

installProFTPD()
{
  # installation de ProFTPD
  sudo apt-get install proftpd -y

  # installation d'openSSL
  sudo apt-get install openssl -y
}

configureProFTPD()
{
  # configuration de base
  # ServerName
  sudo sed -i "/^ServerName/c\ServerName\t\t\t\"$FQDN\"" /etc/proftpd/proftpd.conf
  #sudo sed -i '/^# DefaultRoot/c\DefaultRoot\t\t\t/var/www/html' /etc/proftpd/proftpd.conf

  # génération d'un certificat SSL
  sudo openssl req -x509 -newkey rsa:2048 -keyout /etc/ssl/private/proftpd.key -out /etc/ssl/certs/proftpd.crt -nodes -days 365 -subj "/C=FR/ST=FR/L=FR/O=Oclock/CN=$FQDN"

  # changement des droits sur le certificat
  sudo chmod 600 /etc/ssl/private/proftpd.key
  sudo chmod 600 /etc/ssl/certs/proftpd.crt

  # activer FTP sur SSL
  sudo sed -i '/^#Include \/etc\/proftpd\/tls.conf/c\Include /etc/proftpd/tls.conf' /etc/proftpd/proftpd.conf
  sudo sed -i 's/^#TLS/TLS/g' /etc/proftpd/tls.conf 
  sudo sed -i 's/^TLSVerifyClient/#TLSVerifyClient/' /etc/proftpd/tls.conf 
  sudo sed -i 's/^TLSCA/#TLSCA/g' /etc/proftpd/tls.conf 

  # création d'un lien symbolique /home/student/html -> /var/www/html
  ln -s /var/www/html /home/student/html
}

startAndEnableFTP()
{
  # redémarrer le serveur FTP
  sudo systemctl restart proftpd

  # activer le démarrage automatique
  sudo systemctl enable proftpd
}

#==========================================================================================
#==========================================================================================

echo -e "${RED}"
echo "Installation des mises à jour, de ProFTPD et d'openSSL ..."
echo -e "${NC}"

installUpdate
installProFTPD

echo -e "${RED}"
echo "Installation terminée."
echo "Configuration de ProFTPD et activation du SSL ..."
echo -e "${NC}"

configureProFTPD

echo -e "${RED}"
echo "Configuration terminée."
echo "Redémarrage et activation automatique du service ..."
echo -e "${NC}"

startAndEnableFTP

echo -e "${RED}"
echo "Votre serveur FTP est prêt ! 🎉"
echo "Vous pouvez vous-y connecter depuis FileZilla."
echo ""
echo "Informations de connexion :"
echo "    hôte : $FQDN"
echo "    identifiant : student"
echo "    mot de passe : par dessus les nuages"
echo "    port : laisser vide"
echo ""
echo "Dans FileZilla, vous pourrez accéder à votre dossier /var/www/html grace au raccourci /home/student/html."
echo -e "${NC}"

exit 0
