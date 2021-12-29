<?php

namespace turim;

class Obj{

    public static function create($arr){
        return json_decode (json_encode ($arr), FALSE);
    }

    public static function extend(){
        $arr = array();
        $numargs = func_num_args();
        $arg_list = func_get_args();

        for ($i = 0; $i < $numargs; $i++) {
            $arg = $arg_list[$i];
            foreach ($arg as $key => $value) {
                $arr[$key] = $value;
            }
        }

        return $arr;
    }

}