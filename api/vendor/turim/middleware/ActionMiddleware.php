<?php

namespace turim\middleware;

class ActionMiddleware {
    private $middlewaresBefore = [];
    private $middlewaresAfter = [];

    const BEFORE    = 0;
    const AFTER     = 1;

    public function add(string $methodName, array $middlewares, int $moment = ActionMiddleware::BEFORE) : void {
        if(!is_array($middlewares)) $middlewares = array($middlewares);

        foreach ($middlewares as $_ => &$value) {
            $value = strtolower($value);
        }

        if($moment == ActionMiddleware::AFTER){
            $this->middlewaresAfter[$methodName] = $middlewares;
        }else{
            $this->middlewaresBefore[$methodName] = $middlewares;
        }
    }

    public function getMiddlewares(int $moment) : array {
        return $moment == ActionMiddleware::AFTER ? $this->middlewaresAfter : $this->middlewaresBefore;
    }
}