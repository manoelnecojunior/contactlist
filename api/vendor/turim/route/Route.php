<?php

namespace turim\route;

use turim\tokenization\Extractor;
use turim\tokenization\Token;

class Route {
    private $extractor;
    private $route;
    private $routePattern = '';

    public function __construct(string $route)
    {
        $this->route = $route;
        $this->extractor = new Extractor('/\{\w+(=\w+)?(:\w+)?\}/');
        $this->extractor->load($route);
        
        $this->loadRouteBase();
    }

    public function isEqual(string $route) : bool {
        return preg_match($this->getRoutePattern(), $route);
    }

    public function extract(string $route) : ?array {
        preg_match($this->getRoutePattern(), $route, $result);

        if(count($result) > 0){
            $params = [];
            $tokens = $this->extractor->getTokens();

            array_shift($result);

            for ($i = 0; $i < count($result); $i++) { 
                $params[$tokens[$i]->name] = $result[$i];
            }

            $totalTokens = count($tokens);
            $totalResult = count($result);

            if($totalTokens > $totalResult){
                for ($i = $totalResult; $i < $totalTokens; $i++) { 
                    $params[$tokens[$i]->name] = $tokens[$i]->defaultValue;
                }
            }

            return $params;
        }

        return null;
    }

    private function getRoutePattern() : string{
        return '/' . $this->routePattern . '/im';
    }

    private function loadRouteBase(){
        $route = $this->route;
        $tokens = $this->extractor->getTokens();

        foreach ($tokens as $token) {
            $route = str_replace($token->value, $token->pattern, $route);
        }

        $route = str_replace('/', '\/', $route);

        $this->routePattern = $route;
    }
}