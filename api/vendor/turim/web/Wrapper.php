<?php

namespace turim\web;
 
class Wrapper{

    public static function error($code, $message = false){
        if($message === false){
            $message = $code;
            $code = '';
        }

        return json_encode(array(
            'code'      => $code,
            'status'    => 'error',
            'message'   => $message
        ));
    }

    public static function ok($data = array(), $paging = null){
        return json_encode(array(
            'status' => 'ok',
            'data'   => $data,
            'paging' => $paging
        ));
    }

}