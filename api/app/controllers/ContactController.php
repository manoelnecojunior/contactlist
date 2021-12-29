<?php

namespace app\controllers;

use turim\web\AbstractController;

use turim\middleware\ActionMiddleware;
use turim\UUID;

class ContactController extends AbstractController{
    public function __construct()
    {
        parent::__construct();
    }

    public function insert($contact){
        $contacts = $this->load();

        if(!isset($contact->id)){
            $contact->id = UUID::code('000');
        }

        $contacts[] = $contact;


        $this->save($contacts);

        sleep(3);

        return $contact;
    }
    
    public function delete($contact){
        $index = $this->findIndex($contact->id);
        $contacts = $this->load();
        // unset($contacts[$index]);
        array_splice($contacts, $index, 1);
        $this->save($contacts);

        return [];
    }
    
    public function update($contact){
        $this->delete($contact);
        $this->insert($contact);

        return [];
    }

    public function get($id){
        $contact = $this->find($id);

        if($contact == null){
            return [];
        }

        return $contact;
    }
    
    public function all() : array {
        return $this->load();
    }

    private function find($id){
        $contacts = $this->load();

        foreach($contacts as $contact) {
            if($contact->id == $id){
                return $contact;
            }
        }

        return null;
    }

    private function findIndex($id){
        $contacts = $this->load();

        foreach($contacts as $index => $contact) {
            if($contact->id == $id){
                return $index;
            }
        }

        return null;
    }

    private function load(){
        $content = file_get_contents($this->getContactsFullPath());
        $json = json_decode($content);
        return $json;
    }

    private function save($contacts){
        file_put_contents($this->getContactsFullPath(), json_encode($contacts));
    }

    private function getContactsFullPath(){
        return __APP_ROOT__ . '/data/contacts.json';
    }
}