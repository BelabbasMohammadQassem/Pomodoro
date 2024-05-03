<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $table = 'task';

    // public function getAttribute($key)
    // {
    //     if ($key == "total_pomodoros") {
    //         return $this->attributes["totalPomodoros"];
    //     }

    //     return parent::getAttribute($key);
    // }

    public function attributesToArray()
    {
        $attributes = parent::attributesToArray();

        $mutated = [];
        foreach ($attributes as $key => $value) {
            $mutated[preg_replace('/^total_pomodoros/', 'totalPomodoros', $key)] = $value;
        }

        return $mutated;
    }
}
