<?php

namespace app\middlewares;

use turim\middleware\Middleware;

Middleware::add('after', function($context, $next){
    $context->response->write('<br> middleware after');
    $next();
});