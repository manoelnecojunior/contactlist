<?php

namespace turim\io;
 
class FileEntry {    
    private $filename;

    public function __construct(string $filename)
    {
        $this->filename = $filename;
    }

    public function name() : ?string {
        $info = pathinfo($this->filename);

        return isset($info['filename']) ? $info['filename'] : false;
    }

    public function move(string $to) {
        rename($this->filename, $to);
    }    

    public function extension() : string{
        $path_info = pathinfo($this->filename);

        return isset($path_info['extension']) ? $path_info['extension'] : '';
    }

    public function delete() : bool{
        if(!$this->exist($this->filename)) return true;

        unlink($this->filename);

        return false;
    }

    public function exist() : bool {
        return file_exists($this->filename);
    }

    public function read() : string {
        return @file_get_contents($this->filename);
    }

    public function write($content) : void{
        file_put_contents($this->filename, $content);
    }

    public static function MB($total) : string {
        return FileEntry::KB($total) * 1000;
    }

    public static function KB($total) : string {
        return $total * 1000;
    }

}