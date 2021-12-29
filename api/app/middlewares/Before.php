<?php

namespace app\middlewares;

use turim\middleware\Middleware;

Middleware::add('before', function($context, $next){
    $context->response->write('middleware before <br>');
    $next();
});