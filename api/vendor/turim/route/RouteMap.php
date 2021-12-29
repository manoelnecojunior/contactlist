<?php

namespace turim\route;

class RouteMapParam {
    private $namespace;
    private $params;

    public function __construct(array $params, string $namespace)
    {
        $this->params = $params;
        $this->namespace = $namespace;
    }

    public function getParam(string $name) : string {
        if(!isset($this->params[$name])) return '';

        return $this->params[$name];
    }

    public function getNamespace() : string {
        return $this->namespace;
    }
}


class RouteMap {
    private $mapper = [];

    public function __construct(){

    }

    public function add(string $route, string $namespace) : void {
        $this->mapper[] = [ 'route' => new Route($route), 'namespace' => $namespace];
    }

    public function load(array $maps) : void {
        foreach ($maps as $route => $namespace) {
            $this->add($route, $namespace);
        }
    }

    public function find(string $route) : ?RouteMapParam {
        foreach ($this->mapper as $mapper) {
            $params = $mapper['route']->extract($route);
            if($params != null) return new RouteMapParam($params, $mapper['namespace']);
        }

        return null;
    }
}