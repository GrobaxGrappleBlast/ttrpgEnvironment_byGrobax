
using System;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using srcServer.core.fileHandler;


namespace srcServer.repositories
{
    class TemplateRepository {

        private DAO _dao;
        public TemplateRepository( DAO dao){
            _dao = dao;
        }

        

    }

}