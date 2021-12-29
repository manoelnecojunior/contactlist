<?php

namespace turim\tokenization;

class Extractor {
    private $pattern = '';
    private $tokens = [];

    public function __construct(string $pattern = null)
    {
        $this->pattern = $pattern;
    }

    public function load(string $text){
       $tokens = $this->extractTokens($text);

        if(count($tokens) > 0){
            foreach ($tokens as $token) {
                $this->tokens[] = Token::create($token, true);
            }
        }
    }

    public function exist($token) : bool {
        foreach ($this->tokens as $token) {
            if($token->name == $token) return true;
        }

        return false;
    }

    public function getTokens() : array {
        return $this->tokens;
    }

    public function find(string $tokenName) : ?Token {
        foreach ($this->tokens as $token) {
            if($token->name == $tokenName) return $token;
        }

        return null;
    }

    private function extractTokens(string $text) : array {
        preg_match_all($this->pattern, $text, $result, PREG_PATTERN_ORDER);
        return $result[0];
    }
}