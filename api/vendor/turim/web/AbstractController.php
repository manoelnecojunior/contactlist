<?php

namespace turim\web;

use turim\http\Response;
use turim\http\Request;

use turim\middleware\ActionMiddleware;

abstract class AbstractController {
    public $request;
    public $response;
    public $middleware;

    public function __construct()
    {
        $this->request = Request::getInstance();
        $this->response = new Response();
        $this->middleware = new ActionMiddleware();
    }
}