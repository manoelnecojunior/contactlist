<?php

namespace turim\http;

class Get{

    public function query($name) : string{
        $value = @$_GET[ $name ];

        return $value === false ? '' : $value;
    }
    
    public function exist($name) : bool{
        $value = @$_GET[ $name ];

        return $value === false ? false : true;
    }

    public function toArray() : array {
        return (array)$_GET;
    }
}