<?php

include 'turim\autoloader.php';

turim\Autoloader::init();

use PHPUnit\Framework\TestCase;

use turim\http\Url;

class UrlTest extends TestCase {
    public function testPathFailureString() : void {
        $url = Url::parse('http://test.com.br:80/turim/module/controller/action/param?query01=value01&query02=value02');
        $this->assertNotEquals($url->getPath(), '/turim/module/controller/action/param01');
    }

    public function testPathOkString() : void {
        $url = Url::parse('http://test.com.br:80/turim/module/controller/action/param?query01=value01&query02=value02');
        $this->assertEquals($url->getPath(), '/turim/module/controller/action/param');
    }

    public function testQueryFailureString() : void {
        $url = Url::parse('http://test.com.br:80/turim/module/controller/action/param?query01=value01&query02=value02');
        $query = $url->getQuery();

        $this->assertNotEquals($query['query01'], 'query02');
        $this->assertNotEquals($query['query02'], 'query01');
    }

    public function testQueryOkString() : void {
        $url = Url::parse('http://test.com.br:80/turim/module/controller/action/param?query01=value01&query02=value02');
        $query = $url->getQuery();

        $this->assertEquals($query['query01'], 'value01');
        $this->assertEquals($query['query02'], 'value02');
    }
}