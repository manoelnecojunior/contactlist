<?php

namespace turim\http;

class Request {
    public $post;
    public $get;
    
    private static $current = null;

    public function __construct()
    {
        $this->post = new Post();
        $this->get = new Get();
    }

    public static function getInstance(){
        if(Request::$current == null) Request::$current = new Request();
        return Request::$current;
    }

    public function method() : string {
        return $_SERVER['REQUEST_METHOD'];
    }

    public function isPost() : bool {
        return $this->method() === 'POST';
    }

    public function isAjax() : bool{
        return !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';
    }

    public function isSSL() : bool{
        $url = '';

        if(!isset($_SERVER['SCRIPT_URI'])) $url = $_SERVER['SERVER_PROTOCOL'];
        if(strpos($url, 'https:') === false) return false;

        return true;
    }

    public function getUrl() : Url{
        $url = (isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];

        return Url::parse($url);
    }
}