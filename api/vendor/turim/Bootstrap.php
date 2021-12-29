<?php

namespace turim;

use turim\route\RouteMap;
use turim\io\DirectoryEntry;
use turim\web\FrontController;
use turim\http\Request;

class Bootstrap {
    private $config;
    private $routeMap;
    
    public function __construct()
    {
        $this->config = Config::getInstance();
        $this->routeMap = new RouteMap();
    }

    public function setRoutes(array $routes) : Bootstrap{
        $this->routeMap->load($routes);

        return $this;
    }

    public function start() {
        $this->load();

        $frontController = new FrontController($this->routeMap);
        $frontController->dispatch(Request::getInstance());
    }

    private function load() : Bootstrap{
        $this->loadMiddlewares();

        return $this;
    }

    private function loadMiddlewares() {
        $dir = $this->config->get('app', 'middlewares');
        $files = @DirectoryEntry::readAllFiles($dir);

        foreach ($files as $filename) {
            include "$dir/$filename";
        }
    }
}