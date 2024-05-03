const tasks = {
    init: function () {
        tasks.addButton = document.querySelector("#add");
        tasks.deleteButton = document.querySelector("#delete");
        tasks.cancelButton = document.querySelector("#cancel");
        tasks.form = document.querySelector("#task-form");
        tasks.plusButton = document.querySelector("#plus");
        tasks.minusButton = document.querySelector("#minus");
        tasks.pomodorosNumberInput = document.querySelector("#pomodoros");

        tasks.addButton.addEventListener("click", tasks.toggleForm);

        tasks.cancelButton.addEventListener("click", tasks.toggleForm);
        tasks.plusButton.addEventListener("click", tasks.changePomodorosNumber);
        tasks.minusButton.addEventListener("click", tasks.changePomodorosNumber);
        tasks.form.addEventListener("submit", tasks.add);
        tasks.deleteButton.addEventListener("click", tasks.deleteAll);

        tasks.loadFromAPI();
    },

    add: async function (event) {
        event.preventDefault();

        try {
            const response = await fetch(environment.baseAPIURL + "/api/tasks", {
                method: "POST",
                body: JSON.stringify({
                    title: document.querySelector('#title').value,
                    pomodoros: 0,
                    totalPomodoros: document.querySelector('#pomodoros').value,
                    done: 0
                }),
                headers: {
                    'Content-type': 'application/json'
                }
            });

            if (response.status === 201) {
                const task = await response.json();

                // nouvelle tâche, on affiche le tableau
                document.querySelector('table').classList.remove('hidden');
                // on retire le message "aucune tâche"
                document.querySelector('#no-task-message').classList.add('hidden');

                // on enlève l'option "vide" du select
                if (timer.taskSelect.querySelector('option[value="empty"]')) {
                    // seulement si elle est présente (pas null)
                    timer.taskSelect.querySelector('option[value="empty"]').remove();
                }


                console.log("nouvelle tâche à ajouter au DOM !");
                console.log(task);

                // et on ajoute la tâche au DOM
                tasks.addTaskToDOM(task);
            } else {
                console.error("Erreur lors de l'ajout d'une tâche.");
            }
        } catch (error) {
            console.error(error);
        }
    },

    delete: async function (event) {
        // on récupère l'ID de la tâche à supprimer
        const id = event.currentTarget.parentNode.parentNode.parentNode.querySelector("#row-id").textContent;

        try {
            const response = await fetch(environment.baseAPIURL + "/api/tasks/" + id, {
                method: 'DELETE'
            });
            // on vérifie le code retour HTTP de l'API
            if (response.status === 204) {
                console.info("Tâche supprimée.");

                // on retire la tâche du DOM
                // TODO : améliorer ça
                // pour faire simple, on recharge tout
                tasks.loadFromAPI();
            } else {
                // autre erreur, probablement une erreur 500 mais ça marchera aussi pour les autres erreurs
                // erreur coté serveur (problème de connexion à la bdd par exemple)
                console.error("Impossible de supprimer la tâche : erreur serveur.");
            }
        } catch (error) {
            // ce message d'erreur s'affiche en cas de non réponse de l'API (problème réseau, serveur HS, etc.)
            console.error("Impossible de supprimer la tâche : le serveur ne répond pas.");
        }
    },

    deleteAll: async function (event) {
        try {
            const response = await fetch(environment.baseAPIURL + "/api/tasks", {
                method: 'DELETE'
            });
            // on vérifie le code retour HTTP de l'API
            if (response.status === 204) {
                console.info("Tâches supprimées.");

                tasks.removeAllTasksFromDOM();
            } else {
                // autre erreur, probablement une erreur 500 mais ça marchera aussi pour les autres erreurs
                // erreur coté serveur (problème de connexion à la bdd par exemple)
                console.error("Impossible de supprimer les tâches : erreur serveur.");
            }
        } catch (error) {
            // ce message d'erreur s'affiche en cas de non réponse de l'API (problème réseau, serveur HS, etc.)
            console.error("Impossible de supprimer les tâches : le serveur ne répond pas.");
        }
    },

    setDone: async function (event) {
        // on récupère l'ID de la tâche à modifier
        //console.log(event.currentTarget.parentNode.parentNode.parentNode.querySelector('#row-id').textContent);
        const id = event.currentTarget.parentNode.parentNode.parentNode.querySelector("#row-id").textContent;

        try {
            const response = await fetch(environment.baseAPIURL + "/api/tasks/" + id, {
                method: 'PATCH',
                body: JSON.stringify({
                    done: 1
                }),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                }
            });
            // on vérifie le code retour HTTP de l'API
            if (response.status === 200) {
                console.info("Tâche mise à jour.");

                // TODO : améliorer ça
                // pour faire simple, on recharge tout
                tasks.loadFromAPI();
            } else {
                // autre erreur, probablement une erreur 500 mais ça marchera aussi pour les autres erreurs
                // erreur coté serveur (problème de connexion à la bdd par exemple)
                console.error("Impossible de modifier la tâche : erreur serveur.");
            }
        } catch (error) {
            // ce message d'erreur s'affiche en cas de non réponse de l'API (problème réseau, serveur HS, etc.)
            console.error("Impossible de modifier la tâche : le serveur ne répond pas.");
        }
    },

    setUndone: async function (event) {
        // on récupère l'ID de la tâche à modifier
        //console.log(event.currentTarget.parentNode.parentNode.parentNode.querySelector('#row-id').textContent);
        const id = event.currentTarget.parentNode.parentNode.parentNode.querySelector("#row-id").textContent;

        try {
            const response = await fetch(environment.baseAPIURL + "/api/tasks/" + id, {
                method: 'PATCH',
                body: JSON.stringify({
                    done: 0
                }),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                }
            });
            // on vérifie le code retour HTTP de l'API
            if (response.status === 200) {
                console.info("Tâche mise à jour.");

                // TODO : améliorer ça
                // pour faire simple, on recharge tout
                tasks.loadFromAPI();
            } else {
                // autre erreur, probablement une erreur 500 mais ça marchera aussi pour les autres erreurs
                // erreur coté serveur (problème de connexion à la bdd par exemple)
                console.error("Impossible de modifier la tâche : erreur serveur.");
            }
        } catch (error) {
            // ce message d'erreur s'affiche en cas de non réponse de l'API (problème réseau, serveur HS, etc.)
            console.error("Impossible de modifier la tâche : le serveur ne répond pas.");
        }
    },

    removeAllTasksFromDOM: function () {
        // on vide le tableau
        document.querySelector('tbody').innerHTML = "";
        // on le cache
        document.querySelector('table').classList.add('hidden');
        // on vide les options du select
        timer.taskSelect.innerHTML = "";
        // on ajoute l'option "aucune tâche dispo"
        const option = document.createElement('option');
        option.value = "empty";
        option.textContent = "Aucune tâche disponible, veuillez en ajouter ci-dessous !";
        timer.taskSelect.appendChild(option);
        // on affiche le message "aucune tâche"
        document.querySelector('#no-task-message').classList.remove('hidden');
    },

    loadFromAPI: async function () {

        // on vide les tâches éventuellement présentes
        tasks.removeAllTasksFromDOM();

        try {
            const response = await fetch(environment.baseAPIURL + "/api/tasks");
            const taskList = await response.json();
            //console.log(taskList);

            if (taskList.length > 0) {
                // au moins une tâche présente en BDD, on affiche le tableau
                document.querySelector('table').classList.remove('hidden');
                // on retire le message "aucune tâche"
                document.querySelector('#no-task-message').classList.add('hidden');

                // on vide les options du select
                timer.taskSelect.innerHTML = "";

                // on remplit le tableau & le select
                taskList.forEach(task => {
                    //console.log(task);
                    tasks.addTaskToDOM(task);
                });
            } else {
                // aucune tâche en BDD
                console.log("Aucune tâche en BDD !");
                // on affiche le message "aucune tâche"
                document.querySelector('#no-task-message').classList.remove('hidden');
                // et on cache le tableau
                document.querySelector('table').classList.add('hidden');
            }
        } catch (error) {
            console.error(error);

            document.querySelector('main').classList.add('hidden');
            const p = document.createElement('p');
            p.textContent = "⚠️ impossible de se connecter à l'API.";
            document.querySelector('.container').appendChild(p);
        }

        // si le select de tâches est vide à ce stade, on met un message "Toutes les tâches sont terminées, ajoutez-en de nouvelles !"
        if (timer.taskSelect.innerHTML == "") {
            const option = document.createElement('option');
            option.textContent = "Toutes les tâches sont terminées, ajoutez-en de nouvelles !"
            option.value = "empty";
            timer.taskSelect.appendChild(option);
        }

    },

    addTaskToDOM: function (task) {
        // ajout au tableau
        const template = document.querySelector('#row-template');
        const clone = document.importNode(template.content, true);

        clone.querySelector("#row-title").textContent = task.title;
        clone.querySelector("#row-id").textContent = task.id;
        clone.querySelector("#row-pomodoros").textContent = task.pomodoros + "/" + task.totalPomodoros;
        clone.querySelector(".fa-trash").addEventListener('click', tasks.delete);
        clone.querySelector('.fa-check').addEventListener('click', tasks.setDone);
        clone.querySelector('.fa-xmark').addEventListener('click', tasks.setUndone);

        if (task.done) {
            clone.querySelector("#row-title").classList.add('line-through');
            clone.querySelector("#row-id").classList.add('line-through');
            clone.querySelector("#row-pomodoros").classList.add('line-through');

            clone.querySelector(".fa-check").remove();
        } else {
            clone.querySelector(".fa-xmark").remove();

            // ajout dans le select
            const option = document.createElement('option');
            option.textContent = `N°${task.id} - ${task.title} (${task.pomodoros} pomodoro(s) fait / ${task.totalPomodoros})`;
            option.value = task.id;
            timer.taskSelect.appendChild(option);
        }

        document.querySelector('tbody').appendChild(clone);
    },

    toggleForm: function () {
        tasks.form.classList.toggle('hidden');
        tasks.addButton.classList.toggle('hidden');

        tasks.form.scrollIntoView();
    },

    changePomodorosNumber: function (event) {
        event.preventDefault();

        let pomodorosNumber = parseInt(tasks.pomodorosNumberInput.value);

        if (event.currentTarget.id == "plus") {
            pomodorosNumber++;
        } else if (event.currentTarget.id == "minus") {
            if (pomodorosNumber > 1) {
                pomodorosNumber--;
            }
        }

        tasks.pomodorosNumberInput.value = pomodorosNumber;
    },

    incrementPomodoroCount: async function (taskId) {
        // cette méthode ajoute 1 au compteur de pomorodos de la tâche dont l'ID est en param

        console.log(`on incrémente le nb de pomodoros de la tâche N°${taskId}`);

        // d'abord on récupère la tâche actuelle, pour vérifier son nombre de pomodoros
        try {
            const response = await fetch(environment.baseAPIURL + "/api/tasks/" + taskId);
            const task = await response.json();

            // on augmente le compteur
            task.pomodoros++;

            if (task.pomodoros == task.totalPomodoros) {
                // la tâche vient d'être "terminée"
                // on passe "done" à 1
                task.done = 1;
            }

            // on met à jour coté back
            const response2 = await fetch(environment.baseAPIURL + "/api/tasks/" + taskId, {
                method: 'PATCH',
                body: JSON.stringify({
                    pomodoros: task.pomodoros,
                    done: task.done
                }),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                }
            });

            // et si tout s'est bien passé, on met à jour coté front aussi
            // pour se faciliter la vie, on recharge complètement la liste des tâches depuis l'API
            tasks.loadFromAPI();

        } catch (error) {
            console.error(error);
        }
    }
};

document.addEventListener("DOMContentLoaded", tasks.init);