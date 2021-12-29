<?php

namespace turim;
 
class UUID{

    public static function create($seed = 2){
        return UUID::generator($seed);
    }

    public static function code($pattern = '000-000'){
        $qtde = substr_count($pattern, '0');

        for($i = 0 ; $i < $qtde ; $i++){
            $n = rand(0, 9);
            $index = strpos($pattern, '0');
            $pattern = substr_replace($pattern, $n, $index, 1);
        }

        return $pattern;
    }

    private static function generator($seed){
        $randoms = array();

        for ($i=0; $i < $seed; $i++) { 
            $randoms[] = md5(uniqid(rand(), true)) . '-' . md5(uniqid(rand(), true));
        }

        return implode('-', $randoms);
    }

}