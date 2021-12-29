<?php

namespace turim\io;

class DirectoryEntry {

    public static function readAllFiles(string $directory) : array {
        $files = scandir($directory);

        array_splice($files, 0, 1);
        array_splice($files, 0, 1);

        if($files == false){
            return [];
        }

        return $files;
    }

    public static function dir() : string{
        $dir = __DIR__;
        
        for ($i=0; $i < 4; $i++) { 
            $dir = dirname($dir);
        }

        return $dir;
    }

}