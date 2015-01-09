package dev.gbuchenberger.aleator.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dev.gbuchenberger.aleator.domain.nlp.Root;
import dev.gbuchenberger.aleator.domain.repository.RootRepository;

@RestController
public class RootController {
	protected final Logger log = LoggerFactory.getLogger(getClass());
	
	@Autowired
    private RootRepository roots;

    @RequestMapping("root/{id}")
    public Root getRoot(@PathVariable("id") long id) {
        log.info("Get root");
        return roots.findOne(id);
    }

    @RequestMapping("roots")
    public Iterable<Root> getRoots() {
    log.info("Get roots");
        return roots.findAll();
    }

}
