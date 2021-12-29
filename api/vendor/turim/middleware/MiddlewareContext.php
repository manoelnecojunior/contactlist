<?php

namespace turim\middleware;

class MiddlewareContext {
    public $actionName;
    public $controllerName;
    public $controller;
    public $request;
    public $response;
    public $result;
}