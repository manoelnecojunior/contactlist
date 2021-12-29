<?php

namespace turim\middleware;

class RunnerMiddleware {
    public static function invoke(MiddlewareContext $context, array $middlewares) : bool {
        if(count($middlewares) == 0) return true;
        $invoked = false;

        foreach ($middlewares as $methodName => $routines) {
            foreach ($routines as $routine) {
                if($methodName == '*' || $methodName == $context->actionName){
                    $invoked = false;
                    Middleware::run($routine, $context, function () use (&$invoked){
                        $invoked = true;
                    });
                    if(!$invoked) break;
                }
            }
            if(!$invoked) break;
        }

        return $invoked;
    }
}