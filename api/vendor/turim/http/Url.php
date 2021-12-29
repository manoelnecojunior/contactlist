<?php

namespace turim\http;

class Url {
    private $baseUrl = '';
    private $path = '';
    private $query = [];

    public function __construct()
    {

    }

    public function setBaseUrl(string $url) : void {
        $this->baseUrl = $url;
    }

    public function setQuery(array $query) : void {
        $this->query = $query;
    }

    
    public function setPath(string $path) : void {
        $this->path = $path;
    }

    public function getPath() : string {
        return $this->path;
    }

    public function getBaseUrl() : string {
        return $this->baseUrl;
    }

    public function getQuery() : array {
        return $this->query;
    }

    public static function parse(string $baseUrl) : Url{
        $url = new Url();

        $url->setBaseUrl($baseUrl);
        $url->setQuery($url->extractQuery($baseUrl));
        $url->setPath($url->extractPath($baseUrl));

        return $url;
    }

    private function extractPath(string $baseUrl) : string {
        $parts = explode('?', $baseUrl);
        $parts = explode('//', $parts[0]);
        if(count($parts) != 2) return '';
        $parts = explode('/', $parts[1]);
        array_shift($parts);
        $path = implode('/', $parts);
        return "/$path";
    }

    private function extractQuery(string $baseUrl) : array {
        $parts = explode('?', $baseUrl);
        if(count($parts) < 2) return [];

        $tokens = explode('&', parse_url($baseUrl, PHP_URL_QUERY));
        $queries = [];
        foreach($tokens as $token){
            $keyvalue = explode('=', $token);
            if(count($keyvalue) != 2) continue;
            $queries[$keyvalue[0]] = $keyvalue[1];
        }
        
        return $queries;
    }
}