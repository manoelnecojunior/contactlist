<?php

namespace turim;

class Autoloader{

    private static $mapper = array();
    private static $ignore = array();

    public static function add($appname, $directory){
        Autoloader::$mapper[ $appname ] = $directory;
    }

    public static function exist($appname){
        return isset(Autoloader::$mapper[ $appname ]);
    }

    private static function popule($list = array()){
        foreach($list as $appname => $directory){
            Autoloader::add($appname, $directory);
        }
    }

    public static function ignore($list = array()){
        Autoloader::$ignore = $list;
    }

    private static function isIgnore($appname){
        for ($i = 0; $i < count(Autoloader::$ignore); $i++) { 
            if(Autoloader::$ignore[$i] == $appname) return true;
        }

        return false;
    }

    public static function init($mapper = array()){
        Autoloader::popule($mapper);
        
        spl_autoload_register(function ($class) {
            $name = str_replace('\\', '/', $class);
            
            $partes = explode('/', $name);
            $appname = $partes[0];

            if(Autoloader::isIgnore($appname)) return;

            if(isset( Autoloader::$mapper[ $appname ])){
                // $name = str_replace($appname, '', $name);
                $p = explode('/', $name);
                $arr = array_shift($p);
                $name = '/' . implode('/', $p);
                $name =  Autoloader::$mapper[$appname] . $name;
                @include_once "$name.php";
            }else{
                @include_once "$name.php";
            }

        }, true);
    }

}