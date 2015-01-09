package dev.gbuchenberger.aleator.controllers;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.StringReader;
import java.util.Properties;

import javax.xml.bind.JAXB;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import dev.gbuchenberger.aleator.domain.nlp.Root;
import dev.gbuchenberger.aleator.domain.repository.RootRepository;
import edu.stanford.nlp.pipeline.Annotation;
import edu.stanford.nlp.pipeline.StanfordCoreNLP;

@RestController
public class InputController {
	
	@Autowired
	private ApplicationContext appContext;
	
	@RequestMapping(value = "/input", method = RequestMethod.POST)
    public String postInput(@RequestBody final String input) {

		RootRepository repository = appContext.getBean(RootRepository.class);
		Properties props = new Properties();
		props.put("annotators", "tokenize, ssplit, pos, parse");
		props.put("outputFormat", "xml");
		StanfordCoreNLP pipeline = new StanfordCoreNLP(props);
		Annotation document = new Annotation(input);
		pipeline.annotate(document);
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		String parse = "";
		try {
			pipeline.xmlPrint(document, baos);
			String xmlString = baos.toString("UTF-8");
			baos.close();
			Root root = JAXB.unmarshal(new StringReader(xmlString), Root.class);
			repository.save(root);
	        //Iterable<Root> roots = repository.findAll();
	        
	        for (int i = 0; i < root.getDocument().getSentences().getSentence().toArray().length; i++) {
	        	for (int j = 0; j < root.getDocument().getSentences().getSentence().get(i).getContentItems().toArray().length; j++) {
	        		if (root.getDocument().getSentences().getSentence().get(i).getContentItems().get(j).getItemParse() != null){
	        			parse += "<p>" + root.getDocument().getSentences().getSentence().get(i).getContentItems().get(j).getItemParse() + "</p>";
	        			System.out.println(parse);
	        		}
	        	}
	        	
	        }
	        return parse;
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return parse;
		}
    }

}
