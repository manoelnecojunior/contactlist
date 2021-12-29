<?php

namespace turim\collection;

class Dictionary{

    private $arr = array();

    public function add($key, $value){
        $this->arr[$key] = $value;

        return $this;
    }

    public function existKey($key){
        return array_key_exists($key, $this->arr);
    }

    public function get($key){
        if(!$this->existKey($key)) return null;
        return $this->arr[$key];
    }

    public function toArray(){
        return array_values($this->arr);
    }

}