<?php

namespace turim;
 
class Config{
    private $filename;
    private static $current = null;

    public function __construct(string $filename)
    {
        $this->filename = $filename;
    }

    public static function getInstance() : Config {
        if(Config::$current == null){
            Config::$current = new Config('config.ini');
        }

        return Config::$current;
    }

    public function set(string $section, string $key, string $value) : void{
        $configs = [];
        $configs = Config::readFileIni($this->filename);
        if(!isset($section)) $configs[$section] = [];
        $configs[$section][$key] = $value;
        Config::writeFileIni($configs, $this->filename);
    }

    public function get(string $section, string $key) : string {
        $configHost = [];
        $configLocal = Config::readFileIni($this->filename);
        $configs = Obj::extend($configLocal, $configHost);

        if(!isset($configs[$section])) return '';
        if(!isset($configs[$section][$key])) return '';

        return $configs[$section][$key];
    }

    private static function readFileIni(string $filename) : array{
        $content = @parse_ini_file($filename, true, INI_SCANNER_RAW);
        if($content == null) throw new \Exception("Não encontrado arquivo de configuração config.ini", 1);
        return $content;
    }

    private static function writeFileIni(array $configs, string $filename) : bool {
        $content = "";
        $firstInterate = true;

        foreach ($configs as $key => $elem) {
            if($firstInterate){
                $firstInterate = false;
                $content .= "[" . $key . "]\n";
            }else{
                $content .= PHP_EOL . "[" . $key . "]\n";
            }

            foreach ($elem as $key2 => $elem2) {
                if (is_array($elem2)) {
                    for ($i = 0; $i < count($elem2); $i++) {
                        $content .= $key2 . "[] = \"" . $elem2[$i] . "\"\n";
                    }
                } else if ($elem2 == "") {
                    $content .= $key2 . " = \n";
                } else{
                    $content .= $key2 . " = " . $elem2 . "\n";
                }
            }
        }

        if (!$handle = fopen($filename, 'w')) {
            return false;
        }

        if (!fwrite($handle, $content)) {
            return false;
        }

        fclose($handle);
        return true;
    }

}