<?php

namespace turim\http;

class Response {
    private $bufferResponses = [];

    public function __construct()
    {
        
    }

    public function addCookie() : void {

    }

    public function removeCookie() : void {

    }

    public function addHeader(string $name, string $value) : void {

    }
    
    public function downloadFile(string $filename, string $type)  : void {

    }

    public function writeFile(string $filename, string $type) {

    }

    public function writeObject(object $obj) : void {
        $this->write(json_encode($obj));
    }

    public function write(string $byte) : void {
        $this->bufferResponses[] = $byte;
    }

    public function flush() : void {
        echo implode('', $this->bufferResponses);
    }

    public function redirectToUrl($url) : void{
        header("location:$url");
    }
}