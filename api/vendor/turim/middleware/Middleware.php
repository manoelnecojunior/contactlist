<?php

namespace turim\middleware;

use PHPUnit\Framework\Constraint\Callback;

class Middleware {
    private static $middlers = [];

    public static function add(string $name, $fn) : void {
        $name = Middleware::makeKey($name);
        Middleware::$middlers[$name] = $fn;
    }

    public static function run(string $name, MiddlewareContext $context, $fn){
        $name = Middleware::makeKey($name);
        call_user_func(Middleware::$middlers[$name], $context, $fn);
    }

    private static function makeKey(string $name) : string {
        return strtolower($name);
    }
}