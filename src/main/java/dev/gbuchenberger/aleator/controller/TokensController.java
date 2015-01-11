package dev.gbuchenberger.aleator.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dev.gbuchenberger.aleator.domain.nlp.Tokens;
import dev.gbuchenberger.aleator.domain.repository.TokensRepository;

@RestController
public class TokensController {
	protected final Logger log = LoggerFactory.getLogger(getClass());

	@Autowired
	private TokensRepository tokensRepo;

	@RequestMapping("tokens")
	public Iterable<Tokens> getTokens() {
		log.info("Get tokens");
		return tokensRepo.findAll();
	}
	
	@RequestMapping("tokens/random")
	public Tokens getRandomTokens() {
		log.info("Get random tokens");
		return tokensRepo.getRandomTokens();
	}

	@RequestMapping("tokens/{id}")
	public Tokens getTokensById(@PathVariable("id") Long id) {
		log.info("Get tokens by id");
		return tokensRepo.findByHjid(id);
	}

	

}
