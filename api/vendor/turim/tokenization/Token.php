<?php

namespace turim\tokenization;

class Token {
    public $name;
    public $value;
    public $type = 'string';
    public $isRegex;

    public $defaultValue = '';
    public $isOptional;
    public $pattern;

    public function __construct(string $value, bool $isRegex = false)
    {
        $this->value = $value;
        $this->isRegex = $isRegex;

        $this->loadNameAndType();
        $this->loadOptional();
        $this->loadPattern();
        $this->loadDefaultValue();
    }

    public static function create(string $value, bool $isRegex) : Token{
        return new Token($value, $isRegex);
    }

    private function loadDefaultValue(){
        $name = trim($this->plainValue($this->name));
        $p = explode('=', $name);

        if(count($p) < 2){
            $this->defaultValue = '';
            return;
        }

        $this->defaultValue = trim($p[1]);
        $this->name = str_replace('='. $this->defaultValue, '', $this->name);
        $this->isOptional = true;
        $this->pattern .= '?';
    }

    private function loadNameAndType() {
        $value = str_replace('?', '', $this->plainValue($this->value));
        $nameType = explode(':', $value);

        if(count($nameType) < 2){
            $this->name = $this->value;
            $this->type = 'string';
            return;
        }

        $this->type = $nameType[1];
        $this->name = str_replace(':' . $this->type, '', $this->value);
    }

    private function plainValue($value){
        $value = str_replace('?', '', $value);
        $value = str_replace('{', '', $value);
        $value = str_replace('}', '', $value);

        return $value;
    }

    private function loadOptional() {
        $this->isOptional = strpos($this->value, '?') > -1;
    }

    private function loadPattern(){
        if(!$this->isRegex) {
            return;
        }

        if($this->type == 'string'){
            $this->pattern = "(\w+)";
        }else if($this->type == 'int'){
            $this->pattern = "(\d+)";
        }
        
        if($this->isOptional){
            $this->pattern .= '?';
        }
    }
}

