# Docker : Installation

Pour installer Docker (et Docker Compose) sur Ubuntu, il faut suivre la [documentation officielle](https://docs.docker.com/engine/install/ubuntu/). 
Lancez les commandes suivantes, une par une :

```bash
sudo apt update
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
```

Une fois toutes les commandes lancées, déconnectez-vous de votre session.

💡 Sur une VM "serveur", connecté en SSH, il suffit de taper la commande `exit` puis de se reconnecter.

💡 Sur le téléporteur, déconnectez-vous de votre session graphique et reconnectez-vous (utilisateur `student`, mot de passe `par dessus les nuages`), ou redémarrez la machine virtuelle.

Une fois reconnecté, lancez les commandes suivantes pour vérifier la version de Docker et de Docker Compose installée :

```bash
docker --version
docker compose version
```
