<?php

namespace turim\http;

class Post{
    
    public function json() : object{
        $raw = $this->raw();
        if($raw == false) return false;

        return json_decode( $raw );
    }

    public function query($name) : string{
        if(!isset($_POST[ $name ])) return false;
        else return $_POST[ $name ];
    }

    public function get($name) : string{
        return $this->query($name);
    }

    public function raw() : string{
        return @file_get_contents("php://input");
    }

    public function form() : array {
        return (array)$_POST;
    }

}