@include('partials/header')

    <h2>Routes disponibles :</h2>
        <ul>
            <li><strong>POST - /api/tasks :</strong> créer une nouvelle tâche.<br><small>(Les données sont a envoyer au format JSON, avec le bon content-type.)</small></li>
            <li><strong>GET - /api/tasks :</strong> obtenir la liste des tâches.</li>
            <li><strong>GET - /api/tasks/{ID} :</strong> obtenir les informations d'une tâche en fonction de son <strong>{ID}</strong>.</li>
            <li><strong>PATCH - /api/tasks/{ID} :</strong> mettre à jour les informations d'une tâche en fonction de son <strong>{ID}</strong>.<br><small>(Les données sont a envoyer au format JSON, avec le bon content-type.)</small></li>
            <li><strong>DELETE - /api/tasks :</strong> supprime toutes les tâches.</li>
            <li><strong>DELETE - /api/tasks/{ID} :</strong> supprime une tâche en fonction de son <strong>{ID}</strong>.</li>
        </ul>

@include('partials/footer')
