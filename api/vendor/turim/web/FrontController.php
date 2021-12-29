<?php

namespace turim\web;

use Exception;

use turim\Config;
use turim\Template;

use turim\io\FileEntry;

use turim\http\Request;
use turim\http\Response;
use turim\route\RouteMap;
use turim\route\RouteMapParam;

use turim\middleware\ActionMiddleware;
use turim\middleware\MiddlewareContext;
use turim\middleware\RunnerMiddleware;

class FrontController {
    private $config;

    public function __construct(RouteMap $routeMap)
    {
        $this->config = Config::getInstance();
        $this->routeMap = $routeMap;
    }

    public function dispatch(Request $request) : void {
        $response = new Response();
        $url = $request->getUrl();
        $path = $url->getPath();
        $route = $this->routeMap->find($path);

        if($route == null){
            $this->dispatchRouteNotFound($request, $response);
            return;
        }

        $this->dispatchRouteFound($request, $response, $route);
    }

    private function dispatchRouteFound(Request $request, Response $response, RouteMapParam $param) {
        $controllerName = $this->getControllerName($param);
        if(!class_exists($controllerName)){
            $this->dispatchControllerNotFound($controllerName, $request, $response, $param);
            return;
        }
        
        $actionName = $this->getActionName($param);
        $controller = $this->createController($controllerName);
        if(!method_exists($controller, $actionName)){
            $this->dispatchActionNotFound($controllerName, $actionName, $request, $response, $param);
            return;
        }
        
        $frontController = $this;
        set_error_handler(function($code) use ($frontController, $request, $response) {
            $ex = new Exception("Generic error code = $code", $code);
            $frontController->dispatchException($ex, $request, $response);
            die;
        });
        
        try {
            $actionContext = new MiddlewareContext();
            $actionContext->controller = $controller;
            $actionContext->controllerName = $controllerName;
            $actionContext->actionName = $actionName;
            $actionContext->request = $request;
            $actionContext->response = $response;

            $middlewares = $controller->middleware->getMiddlewares(ActionMiddleware::BEFORE);
            $isContinue = RunnerMiddleware::invoke($actionContext, $middlewares);
            
            if($isContinue){
                $actionParam = $this->getActionParameter($request);
                $result = $this->invokeAction($controller, $actionName, $actionParam);
                if($result != null) {
                    $response->write($result);
                }
            }

            $middlewares = $controller->middleware->getMiddlewares(ActionMiddleware::AFTER);
            RunnerMiddleware::invoke($actionContext, $middlewares);
            $response->flush();
        } catch (Exception $e) {
            $this->dispatchException($e, $request, $response);
        }
    }
    
    private function invokeAction(AbstractController $controller, string $actionName, array $parameters = []) : string{ 
        $result = call_user_func_array([$controller, $actionName], $parameters);

        if(is_string($result)){
            return $result;
        }

        return json_encode($result);
    }

    private function getActionParameter(Request $request) : array {
        $actionParam = [];

        if($request->isPost()){
            if($request->isAjax()){
                $actionParam[] = $request->post->json();
            }else{
                $actionParam[] = $request->post->form();
            }
        }else{
            $actionParam = $request->get->toArray();
        }

        return $actionParam;
    }
    
    private function createController(string $controllerName){
        return new $controllerName();
    }

    private function getActionName(RouteMapParam $param) : string {
        return $param->getParam('{action}');
    }
    
    private function getControllerName(RouteMapParam $param) : string{
        $namespace = $param->getNamespace();
        $controllerName = $param->getParam('{controller}') . 'Controller';

        $controllerName = ucfirst($controllerName);

        return "$namespace\\$controllerName";
    }

    public function dispatchException(Exception $e, Request $request, Response $response) : void {
        $content = $this->renderDefaultTemplate($this->getTemplateError(), 'exception_template', [
            '{{TITLE}}' => 'Exception - Turim',
            '{{MESSAGE}}' => $e->getMessage(),
            '{{FILENAME}}' => $e->getFile(),
            '{{LINE}}' => $e->getLine(),
            '{{STACK}}' => $e->getTraceAsString()
        ]);

        $response->write($content);
        $response->flush();
    }

    private function dispatchRouteNotFound(Request $request, Response $response) : void {
        $path = $request->getUrl()->getPath();
        $content = $this->renderDefaultTemplate($this->getTemplateTitleAndDescription(), 'route_not_found_template', [
            '{{TITLE}}' => 'Route Not Found - Turim',
            '{{DESCRIPTION}}' => "The route $path was not found on this server.",
        ]);

        $response->write($content);
        $response->flush();
    }

    private function dispatchControllerNotFound(string $controllerName, Request $request, Response $response, RouteMapParam $param) : void {
        $path = $request->getUrl()->getPath();
        $content = $this->renderDefaultTemplate($this->getTemplateTitleAndDescription(), 'controller_not_found_template', [
            '{{TITLE}}' => 'Controller Not Found - Turim',
            '{{DESCRIPTION}}' =>"The controller $controllerName was not found on this server."
        ]);

        $response->write($content);
        $response->flush();
    }

    private function dispatchActionNotFound(string $controllerName, string $actionName, Request $request, Response $response, RouteMapParam $param) : void {
        $path = $request->getUrl()->getPath();
        $content = $this->renderDefaultTemplate($this->getTemplateTitleAndDescription(), 'action_not_found_template', [
            '{{TITLE}}' => 'Action Not Found - Turim',
            '{{DESCRIPTION}}' =>"The action $controllerName->$actionName was not found on this server."
        ]);

        $response->write($content);
        $response->flush();
    }

    private function renderDefaultTemplate(string $defaultTemplateHtml, string $templateName, array $variables) : string {
        $templateHtml = $defaultTemplateHtml;
        
        $templateFilename = $this->config->get('errors', $templateName);
        if($templateFilename != false){
            $file = new FileEntry($templateFilename);
            if($file->exist()){
                $templateHtml = $file->read();
            }
        }

        $template = new Template($templateHtml);
        $template->load($variables);
        return $template->render();
    }

    private function getTemplateError() : string {
        return <<<HTML
            <!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
            <html>
                <head>
                    <title>{{TITLE}}</title>
                </head>
                <body>
                    <h1>{{TITLE}}</h1>
                    <p>{{MESSAGE}} - {{FILENAME}} line {{LINE}}</p>
                    <h3>Stack</h3>
                    <p>{{STACK}}</p>
                    <hr>
                    <address>Turim Framework</address>
                </body>
            </html>
        HTML;
    }

    private function getTemplateTitleAndDescription() : string {
        return <<<HTML
            <!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
            <html>
                <head>
                    <title>{{TITLE}}</title>
                </head>
                <body>
                    <h1>{{TITLE}}</h1>
                    <p>{{DESCRIPTION}}</p>
                    <hr>
                    <address>Turim Framework</address>
                </body>
            </html>
        HTML;
    }
}