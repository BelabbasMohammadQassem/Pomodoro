<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TaskController extends Controller
{
    public function list()
    {
        // récupérer toutes les tâches en BDD
        $tasks = Task::all();

        // retourner cette liste de tâches au format JSON
        //* Laravel, quand il voit qu'on retourne un tableau dans une méthode de contrôleur va comprendre qu'on cherche à faire une API, et va automatiquement convertir le tableau en JSON.
        return $tasks;
    }

    public function show($id)
    {
        // récupérér une tâche spécifique en fonction de son $id
        $task = Task::find($id);

        // gestion d'erreur 404 si la tâche n'existe pas
        if(is_null($task)) {
            return response(null, 404);
        }

        // retourn cette tâche au format JSON
        return $task;
    }

    public function create(Request $request)
    {
        // 0. on récupère les données reçues
        $title = $request->input('title');
        $pomodoros = $request->input('pomodoros');
        $totalPomodoros = $request->input('totalPomodoros');
        $done = $request->input('done');

        // 1. créer un nouvel objet Task
        $task = new Task();

        // 2. remplir les propriétés de cet objet
        $task->title = $title;
        $task->pomodoros = $pomodoros;
        $task->total_pomodoros = $totalPomodoros;
        $task->done = $done;

        // 3. on le sauvegarde
        if($task->save()) {
            // la sauvegarde a fonctionné
            // on retourne le json de l'objet ajouté avec le code 201 Created
            return response($task, 201);
        } else {
            // la sauvegarde a échoué, on retourne une erreur 500
            return response(null, 500);
        }
    }

    public function update(Request $request, $id)
    {
        // pour la modification, on essaye d'abord de récupérer l'objet à modifier, avant de valider les données reçues !

        // 1. récupérer l'objet Task à modifier
        //! attention, ici on doit vérifier si l'objet qu'on nous demande de modifier existe ou pas !
        $task = Task::find($id);
        if(is_null($task)) {
            // si la tâche est null, c'est qu'elle n'existe pas en BDD !
            return response(null, 404);
        }

        // 0. on récupère les données reçues
        $title = $request->input('title');
        $pomodoros = $request->input('pomodoros');
        $totalPomodoros = $request->input('totalPomodoros');
        $done = $request->input('done');

        // 2. remplir les propriétés de cet objet
        //! seulement si elles ont été fournies à l'API (= not null)
        $task->title = $title ?? $task->title;
        $task->pomodoros = $pomodoros ?? $task->pomodoros;
        $task->total_pomodoros = $totalPomodoros ?? $task->total_pomodoros;
        $task->done = $done ?? $task->done;

        // 3. on le sauvegarde
        if($task->save()) {
            // la sauvegarde a fonctionné, on retourne le json de l'objet ajouté avec le code 200 OK
            return response($task, 200);
        } else {
            // la sauvegarde a échoué, on retourne une erreur 500
            return response(null, 500);
        }
    }

    public function delete($id)
    {
        // 1. récupérer l'objet Task à supprimer
        //! attention, ici on doit vérifier si l'objet qu'on nous demande de supprimer existe ou pas !
        $task = Task::find($id);

        // gestion d'erreur 404 :
        if(is_null($task)) {
            // si la tâche est null, c'est qu'elle n'existe pas en BDD !
            return response(null, 404);
        }

        // 2. on le supprime
        if($task->delete()) {
            // tout s'est bien passé, 204 No Content
            return response(null, 204);
        } else {
            // la suppression a échouée, on retourne une erreur 500
            return response(null, 500);
        }
    }

    public function deleteAll()
    {
        // récupérer toutes les tâches en BDD
        $tasks = Task::all();

        foreach($tasks as $task) {
            $task->delete();
        }

        // tout s'est bien passé, 204 No Content
        return response(null, 204);
    }
}
