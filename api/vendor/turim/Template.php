<?php

namespace turim;

class Template {
    private $content;
    private $mapper = [];

    public function __construct(string $content)
    {
        $this->content = $content;
    }

    public function add(string $key, string $value) : Template {
        $this->mapper[$key] = $value;
        return $this;
    }

    public function load(array $keyvalues) : Template {
        foreach ($keyvalues as $key => $value) {
            $this->add($key, $value);
        }

        return $this;
    }

    public function render() : string {
        $content = $this->content;

        foreach ($this->mapper as $key => $value) {
            $content = str_replace($key, $value, $content);
        }

        return $content;
    }
}