const timer = {

    // pomodoro: 1500,
    // short: 300,
    // long: 900,

    modes: {
        "pomodoro": 1500,
        "short-break": 300,
        "long-break": 900
    },

    init: function () {
        timer.startButton = document.querySelector('#start');
        timer.pauseButton = document.querySelector('#pause');
        timer.time = document.querySelector('#time');
        timer.mode = document.querySelector('#mode');
        timer.taskSelect = document.querySelector("#task-select");

        timer.startButton.addEventListener('click', timer.start);
        timer.pauseButton.addEventListener('click', timer.pause);
        timer.mode.addEventListener('change', timer.changeMode);
    },

    start: function () {
        timer.startButton.classList.add('hidden');
        timer.pauseButton.classList.remove('hidden');

        notification.send("Lancement du chrono !");

        timer.interval = setInterval(timer.tick, 1000);

        // on passe le select task en disabled, pour que l'user ne change pas la tâche en cours
        timer.taskSelect.setAttribute('disabled', '');
    },

    pause: function () {
        timer.pauseButton.classList.add('hidden');
        timer.startButton.classList.remove('hidden');

        // on passe le select task en disabled, pour que l'user ne change pas la tâche en cours
        timer.taskSelect.removeAttribute('disabled');

        // on stoppe le chrono
        clearInterval(timer.interval);
    },

    end: function () {
        // on change les boutons visibles
        timer.pauseButton.classList.add('hidden');
        timer.startButton.classList.remove('hidden');

        // on stoppe le chrono
        clearInterval(timer.interval);

        // on réinitialise tous les chronos
        timer.modes.pomodoro = 1500;
        timer.modes["short-break"] = 300;
        timer.modes["long-break"] = 900;

        // si on est sur un pomodoro
        if(timer.mode.value == "pomodoro") {
            // on récupère l'ID de la tâche commencée
            const id = timer.taskSelect.value;
            if(id != "empty") {
                // une tâche existante a été sélectionnée
                // on incrémente son nombre de pomodoros
                tasks.incrementPomodoroCount(id);
            }

            // on envoie la notif de fin
            notification.send("Fin du pomodoro ! Il est temps de faire une petite pause.");

            // on passe en mode pause courte
            timer.mode.value = "short-break";
            timer.changeMode();
        } else if (timer.mode.value == "short-break") {
            // on envoie la notif de fin
            notification.send("Fin de la pause, il est temps de se remettre au boulot.");

            // on passe en mode pomodoro
            timer.mode.value = "pomorodo";
            timer.changeMode();
        } else if (timer.mode.value == "long-break") {
            // on envoie la notif de fin
            notification.send("Fin de la pause, il est temps de se remettre au boulot.");

            // on passe en mode pomodoro
            timer.mode.value = "pomorodo";
            timer.changeMode();
        } else {
            console.error("Erreur : mode inconnu !");
        }
    },

    tick: function () {
        // méthode appelée chaque seconde une fois le chrono lancée !

        // on récupère le mode actuel
        const currentMode = timer.mode.value;

        // on retire une seconde du chrono
        timer.modes[currentMode]--;

        // on met à jour l'affichage
        timer.update(timer.modes[currentMode]);

        // si le chrono vient d'atteindre 0, fini !
        if (timer.modes[currentMode] == 0) {
            // on stoppe le chrono
            timer.end();
        }

    },

    update: function (timerToUpdate) {
        // calcul des minutes
        let minutes = Math.floor(timerToUpdate / 60);
        if (minutes < 10) {
            // ajout du 0 devant si <10
            minutes = "0" + minutes;
        }

        // calcul des secondes
        let seconds = timerToUpdate % 60;
        if (seconds < 10) {
            // ajout du 0 devant si <10
            seconds = "0" + seconds;
        }

        // mise à jour du timer
        timer.time.textContent = minutes + ":" + seconds;
    },

    changeMode: function() {
        //console.log(timer.mode.value);

        // on stoppe le chrono (s'il est démarré)
        timer.pause();

        // on récupère le mode choisi
        const currentMode = timer.mode.value;

        // on met à jour le texte du bouton & on affiche le select task
        if(currentMode == "pomodoro") {
            timer.startButton.textContent = "Commencer à travailler !";
            timer.taskSelect.classList.remove('hidden');
            document.querySelector('label[for="task-select"]').classList.remove('hidden'); 
        } else {
            timer.startButton.textContent = "Démarrer la pause";
            timer.taskSelect.classList.add('hidden'); 
            document.querySelector('label[for="task-select"]').classList.add('hidden'); 
        }

        // en fonction du mode choisi, on met à jour le timer
        timer.update(timer.modes[currentMode]);

        // on met à jour la couleur de fond
        document.body.style.backgroundColor = "var(--" + timer.mode.value + "-color)";
    }
};

document.addEventListener('DOMContentLoaded', timer.init);