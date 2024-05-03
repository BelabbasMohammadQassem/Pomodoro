<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\TaskController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

//! L'URL des routes dans api.php sera préfixée par /api/

// CREATE

// Route d'ajout d'une nouvelle tâche
// Type : post
// Chemin : http://127.0.0.1:8000/api/tasks
// Controller : TaskController
// Méthode : create
Route::post('/tasks', [TaskController::class, 'create']);

// READ

// Route de récupération des tâches
// Type : get
// Chemin : http://127.0.0.1:8000/api/tasks
// Controller : TaskController
// Méthode : list
Route::get('/tasks', [TaskController::class, 'list']);

// Route de récupération d'une tâche selon son id
// Type : get
// Chemin : http://127.0.0.1:8000/api/tasks/{id}
// Controller : TaskController
// Méthode : show
Route::get('/tasks/{id}', [TaskController::class, 'show'])->where('id', '[0-9]+');

// UPDATE

// Route de modification d'une tâche selon son id
// Type : patch
// Chemin : http://127.0.0.1:8000/api/tasks/{id}
// Controller : TaskController
// Méthode : update
Route::patch('/tasks/{id}', [TaskController::class, 'update'])->where('id', '[0-9]+');

// DELETE

// Route de suppression d'une tâche selon son id
// Type : delete
// Chemin : http://127.0.0.1:8000/api/tasks/{id}
// Controller : TaskController
// Méthode : delete
Route::delete('/tasks/{id}', [TaskController::class, 'delete'])->where('id', '[0-9]+');

// Route de suppression de toutes les tâches
// Type : delete
// Chemin : http://127.0.0.1:8000/api/tasks
// Controller : TaskController
// Méthode : delete
Route::delete('/tasks', [TaskController::class, 'deleteAll']);
